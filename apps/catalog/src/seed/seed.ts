import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Governorate } from '../modules/governorates/governorates.entity';
import { Station } from '../modules/stations/stations.entity';
import { TypeOfTrain } from '../modules/trainType/train-type.entity';
import { ClassesOfTrains } from '../modules/trainClass/train-class.entity';
import { Train } from '../modules/train/train.entity';
import { SeatSide } from '../modules/coachLayout/layout-seat.entity';
import { CoachLayoutService } from '../modules/coachLayout/coach-layouts.service';
import { CoachesService } from '../modules/coach/coaches.service';
import { FareService } from '../modules/fare/fare.service';
import { TimetablesService } from '../modules/timetable/timetables.service';
import { TimetableStopsService } from '../modules/timetableStops/timetable-stops.service';
import { addDays, cairoDateOf } from '../modules/trip-generation/cairo-time';

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const GOVERNORATES: [string, string][] = [
  ['Cairo', 'القاهرة'], ['Qalyubia', 'القليوبية'], ['Gharbia', 'الغربية'], ['Beheira', 'البحيرة'],
  ['Alexandria', 'الإسكندرية'], ['Giza', 'الجيزة'], ['Beni Suef', 'بني سويف'], ['Minya', 'المنيا'],
  ['Assiut', 'أسيوط'], ['Sohag', 'سوهاج'], ['Luxor', 'الأقصر'], ['Aswan', 'أسوان'],
];

// key -> [English, Arabic, governorate (English), km from Ramsis along its line]
const STATIONS: Record<string, [string, string, string, number]> = {
  ramsis: ['Ramsis Station', 'محطة رمسيس', 'Cairo', 0],
  banha: ['Banha', 'بنها', 'Qalyubia', 47],
  tanta: ['Tanta', 'طنطا', 'Gharbia', 90],
  damnhour: ['Damnhour', 'دمنهور', 'Beheira', 140],
  sidigaber: ['Sidi Gaber', 'سيدي جابر', 'Alexandria', 205],
  elraml: ['El Raml Station', 'محطة الرمل', 'Alexandria', 208],
  giza: ['Giza', 'الجيزة', 'Giza', 12],
  benisuef: ['Beni Suef', 'بني سويف', 'Beni Suef', 123],
  minya: ['Minya', 'المنيا', 'Minya', 245],
  assiut: ['Assiut', 'أسيوط', 'Assiut', 375],
  sohag: ['Sohag', 'سوهاج', 'Sohag', 467],
  luxor: ['Luxor', 'الأقصر', 'Luxor', 670],
  aswan: ['Aswan', 'أسوان', 'Aswan', 879],
};

const TRAIN_TYPES: Record<string, [string, string]> = {
  VIP: ['VIP', 'في آي بي'],
  Spanish: ['Spanish', 'إسباني'],
  Russian: ['Russian', 'روسي'],
  Talgo: ['Talgo', 'تالجو'],
  Ordinary: ['Ordinary', 'عادي'],
};

// key -> [English, Arabic, piastres per km]
const CLASSES: Record<string, [string, string, number]> = {
  first: ['First Class AC', 'الدرجة الأولى مكيفة', 90],
  secondAc: ['Second Class AC', 'الدرجة الثانية مكيفة', 60],
  second: ['Second Class', 'الدرجة الثانية', 40],
  third: ['Third Class', 'الدرجة الثالثة', 25],
};

function seats(rows: number, left: number, right: number) {
  const out: { seatNumber: string; rowNumber: number; position: number; side: SeatSide }[] = [];
  let n = 1;
  for (let row = 1; row <= rows; row++) {
    for (let p = 1; p <= left; p++) out.push({ seatNumber: String(n++), rowNumber: row, position: p, side: SeatSide.LEFT });
    for (let p = 1; p <= right; p++) out.push({ seatNumber: String(n++), rowNumber: row, position: p, side: SeatSide.RIGHT });
  }
  return out;
}

// class key -> layout
const LAYOUTS: Record<string, { name_ar: string; name_en: string; description: string; seats: ReturnType<typeof seats> }> = {
  first: { name_ar: 'عربة أولى 2+1', name_en: 'First Class AC 2+1', description: '2+1, 12 rows', seats: seats(12, 2, 1) },
  secondAc: { name_ar: 'عربة ثانية مكيفة 2+2', name_en: 'Second Class AC 2+2', description: '2+2, 15 rows', seats: seats(15, 2, 2) },
  second: { name_ar: 'عربة ثانية 2+2', name_en: 'Second Class 2+2', description: '2+2, 16 rows', seats: seats(16, 2, 2) },
  third: { name_ar: 'عربة ثالثة 3+2', name_en: 'Third Class 3+2', description: '3+2, 16 rows', seats: seats(16, 3, 2) },
};

type StopDef = [station: string, arrival: string | null, departure: string | null];

interface TrainDef {
  number: number;
  type: string;
  days: string[];
  coaches: string[]; // class key per coach, coach number = index + 1
  stops: StopDef[];
}

const TRAINS: TrainDef[] = [
  {
    number: 916, type: 'Spanish', days: ALL_DAYS,
    coaches: ['first', 'first', 'secondAc', 'secondAc', 'secondAc'],
    stops: [
      ['ramsis', null, '19:30'], ['banha', '20:15', '20:18'], ['tanta', '20:55', '20:58'],
      ['damnhour', '21:45', '21:48'], ['sidigaber', '22:40', '22:43'], ['elraml', '23:00', null],
    ],
  },
  {
    number: 917, type: 'Spanish', days: ALL_DAYS,
    coaches: ['first', 'secondAc', 'secondAc', 'secondAc'],
    stops: [
      ['elraml', null, '12:30'], ['sidigaber', '12:37', '12:40'], ['damnhour', '13:45', '13:48'],
      ['tanta', '14:50', '14:53'], ['banha', '15:30', '15:33'], ['ramsis', '16:00', null],
    ],
  },
  {
    // The overnight train: leaves Cairo 23:00, boards at Assiut 04:10, reaches Aswan 09:30.
    number: 981, type: 'Talgo', days: ALL_DAYS,
    coaches: ['first', 'first', 'secondAc', 'secondAc', 'third'],
    stops: [
      ['ramsis', null, '23:00'], ['giza', '23:20', '23:22'], ['benisuef', '01:20', '01:23'],
      ['minya', '02:50', '02:53'], ['assiut', '03:50', '04:10'], ['sohag', '05:40', '05:43'],
      ['luxor', '07:30', '07:35'], ['aswan', '09:30', null],
    ],
  },
  {
    // Runs only on Fridays.
    number: 1001, type: 'Ordinary', days: ['friday'],
    coaches: ['second', 'second', 'third', 'third'],
    stops: [['ramsis', null, '06:00'], ['banha', '07:10', '07:12'], ['tanta', '08:10', null]],
  },
  {
    // Timetabled at 00:30: nonexistent on the spring-forward night.
    number: 1005, type: 'Ordinary', days: ALL_DAYS,
    coaches: ['third', 'third'],
    stops: [['ramsis', null, '00:30'], ['banha', '01:40', '01:42'], ['tanta', '02:30', null]],
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const get = <T>(token: new (...args: never[]) => T) => app.get(token, { strict: false });

  const dataSource = get(DataSource);
  const layouts = get(CoachLayoutService);
  const coaches = get(CoachesService);
  const fares = get(FareService);
  const timetables = get(TimetablesService);
  const timetableStops = get(TimetableStopsService);

  const governorateRepo = dataSource.getRepository(Governorate);
  const stationRepo = dataSource.getRepository(Station);
  const typeRepo = dataSource.getRepository(TypeOfTrain);
  const classRepo = dataSource.getRepository(ClassesOfTrains);
  const trainRepo = dataSource.getRepository(Train);

  const governorateIds: Record<string, string> = {};
  for (const [en, ar] of GOVERNORATES) {
    const row = (await governorateRepo.findOneBy({ name_en: en })) ?? (await governorateRepo.save(governorateRepo.create({ name_en: en, name_ar: ar })));
    governorateIds[en] = row.id;
  }

  const stationIds: Record<string, string> = {};
  for (const [key, [en, ar, governorate]] of Object.entries(STATIONS)) {
    const row =
      (await stationRepo.findOneBy({ name_en: en })) ??
      (await stationRepo.save(
        stationRepo.create({ name_en: en, name_ar: ar, address: en, isActive: true, governorateId: governorateIds[governorate], alternativeNames: [] }),
      ));
    stationIds[key] = row.id;
  }

  const typeIds: Record<string, string> = {};
  for (const [key, [en, ar]] of Object.entries(TRAIN_TYPES)) {
    const row = (await typeRepo.findOneBy({ name_en: en })) ?? (await typeRepo.save(typeRepo.create({ name_en: en, name_ar: ar })));
    typeIds[key] = row.id;
  }

  const classIds: Record<string, string> = {};
  for (const [key, [en, ar]] of Object.entries(CLASSES)) {
    const row = (await classRepo.findOneBy({ name_en: en })) ?? (await classRepo.save(classRepo.create({ name_en: en, name_ar: ar })));
    classIds[key] = row.id;
  }

  // Layouts go through the service: adjacency is derived and validated there.
  const layoutIds: Record<string, string> = {};
  for (const [key, layout] of Object.entries(LAYOUTS)) {
    const created = await layouts.create({ ...layout });
    layoutIds[key] = created.id;
  }

  const today = cairoDateOf(Date.now());

  for (const def of TRAINS) {
    if (await trainRepo.findOneBy({ number: def.number })) {
      console.log(`Train ${def.number} already exists, skipping`);
      continue;
    }

    const train = await trainRepo.save(trainRepo.create({ number: def.number, typeOfTrain: { id: typeIds[def.type] } }));

    for (let i = 0; i < def.coaches.length; i++) {
      await coaches.create({
        coachNumber: i + 1,
        trainId: train.id,
        classOfTrainId: classIds[def.coaches[i]],
        coachLayoutId: layoutIds[def.coaches[i]],
      });
    }

    // Every in-order pair, for every class the train carries. The price never falls with distance.
    for (const classKey of new Set(def.coaches)) {
      const rate = CLASSES[classKey][2];
      for (let i = 0; i < def.stops.length - 1; i++) {
        for (let j = i + 1; j < def.stops.length; j++) {
          const km = Math.abs(STATIONS[def.stops[j][0]][3] - STATIONS[def.stops[i][0]][3]);
          await fares.create({
            trainId: train.id,
            trainClassId: classIds[classKey],
            originStationId: stationIds[def.stops[i][0]],
            destinationStationId: stationIds[def.stops[j][0]],
            priceInPiasters: Math.max(1000, Math.round(km * rate)),
          });
        }
      }
    }

    const timetable = await timetables.create({
      departureTime: def.stops[0][2] as string,
      effectiveFrom: today,
      effectiveTo: addDays(today, 730),
      workingDays: def.days,
      status: true,
      trainId: train.id,
    });

    for (let i = 0; i < def.stops.length; i++) {
      const [station, arrival, departure] = def.stops[i];
      await timetableStops.create({
        arrivalTime: arrival,
        departureTime: departure,
        stopOrder: i + 1,
        timetableId: timetable.id,
        stationId: stationIds[station],
      });
    }

    // The same path the operator uses.
    const summary = await timetables.publish(timetable.id);
    console.log(`Train ${def.number}: ${summary.generated} trips generated, ${summary.failed.length} failed`);
  }

  await app.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
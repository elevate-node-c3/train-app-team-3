import { Module } from "@nestjs/common";
import { CatalogClientModule } from "../../clients/catalog/catalog-client.module";
import { AuthModule } from "../auth/auth.module";
import { CatalogController } from "./catalog.controller";

@Module({
  imports: [CatalogClientModule, AuthModule],
  controllers: [CatalogController],
})
export class CatalogModule {}

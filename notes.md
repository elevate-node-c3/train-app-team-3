What’s missing or wrong vs the story

1. Round trip (BR-20) — not implemented

No return-date field on search
No “return list from chosen outbound” RPC
Server does not read outbound arrival and filter “depart strictly after”
No BR-20 empty reasons: “No return trains on that date” vs “nothing leaves after your outbound arrives”
Overnight / same-day return edge cases not covered 2. Trip stops — proto only, no code

GetTripStops exists in catalog.proto
No controller/service in catalog, no gateway route
No cache catalog:trip-stops:…, no date-when-it-changes on stops 3. Recent searches (BR-21) — stubs only

Proto + gateway recent-search.dto.ts exist
No catalog module, table, or gRPC handlers
Search does not record for the signed-in traveller
Gateway search does not pass user id into catalog
Missing: last 5, dedupe, concurrency guarantee, stale dates, drop deactivated stations, never shared cache 4. Filters / empty reasons incomplete (BR-18, BR-57)

Response has no filter options (train types + fare range from that day’s results)
Only one train_type, not “one or more”
Empty reason does not say “change the filters” when filters wipe the list
Sort tie-break is only “then by departure”; not fully documented (e.g. stable tripId) 5. Design mismatch on recent searches

Proto has client-driven SaveRecentSearch
Story: catalog auto-records every valid search (never fails / never slows search)
What I propose you do (order)
Finish round-trip search in catalog (highest gap)

Extend search (or add SearchReturnTrips) with return_date + outbound_trip_id
Validate return date (BR-20)
Reverse route, same class; train number outbound-only
Server-side arrival; return legs strictly after
Distinct empty reasons for date vs connection vs filters
Implement GetTripStops

Segment boarding → intermediate → alighting
Cairo times + date when day changes
Cache-aside + invalidate on timetable republish
Implement recent searches properly

Gateway passes authenticated user id on search / get-recent
Auto-record after valid search (fire-and-forget)
DB-level “max 5 + unique key” (not read-then-write)
Drop shared SaveRecentSearch as the main path, or keep it internal only
Harden filters to match the story

Add filter_options on the response
Support multiple train types
Filter-specific empty_reason
Document sort tie-break
Tests for story edge cases

Same-day return after 23:50 arrival
Overnight outbound past return date
Max fare below all fares
Six repeats + six different searches
Two travellers same second
Gateway last — REST for stops, recent searches, return search; keep traveller identity out of shared caches

Bottom line: treat current code as CAT-3 one-way search done; this user story is still mostly backlog. Start with round trip → trip stops → recent searches → filter options, then wire gateway.

If you want, I can implement them in that order starting with round-trip search in apps/catalog.

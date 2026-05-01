# Phase 33 Pattern Map

## Closest Existing Analogs

| New work | Closest analog | Pattern to reuse |
|----------|----------------|------------------|
| Gateway community upload controller | `BE/apps/api-gateway/src/presentation/http/controllers/artwork/upload.controller.ts` | `JwtAuthGuard`, `@ApiBearerAuth()`, `FileInterceptor`, `FilesInterceptor`, `@ApiConsumes('multipart/form-data')`, Swagger multipart body schemas, and `sendRpc`. |
| Community microservice command endpoint | `BE/apps/community-service/src/presentation/microservice/moments.microservice.controller.ts` | `@MessagePattern({ cmd: ... })`, log user/content IDs, delegate to `CommandBus` or `QueryBus`. |
| Community CQRS command handler | `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.ts` | `@CommandHandler`, inject repository interface, wrap unexpected errors with `RpcExceptionHelper.internalError`. |
| Community entity/repository registration | `BE/apps/community-service/src/app.module.ts` | Add entity to `TypeOrmModule.forFeature`, add repository provider to `Repositories`, add command handlers to `CommandHandlers`, and export from domain/infrastructure indexes. |
| GCS upload behavior | `BE/apps/artwork-service/src/domain/services/gcs-storage.service.ts` | Buffer upload, GCS public URL generation, metadata, filename sanitization, size validation style, and `UploadResult` shape. |
| Frontend upload helper | `FE/artium-web/src/@shared/apis/artworkUploadApi.ts` | Client validation, `FormData`, `apiUpload`, stable named functions, stable default export. |
| Frontend upload transport | `FE/artium-web/src/@shared/services/apiClient.ts` | Authenticated XHR upload with progress, abort, timeout, and structured upload errors. |

## Files Expected in Phase 33 Plans

### Backend shared/gateway contract

- `BE/libs/common/src/dtos/community/community-media-upload.dto.ts`
- `BE/libs/common/src/dtos/community/index.ts`
- `BE/libs/common/src/dtos/index.ts`
- `BE/apps/api-gateway/src/presentation/http/controllers/community/uploads.controller.ts`
- `BE/apps/api-gateway/src/app.module.ts`

### Community-service upload and persistence

- `BE/apps/community-service/src/domain/entities/community-media.entity.ts`
- `BE/apps/community-service/src/domain/entities/moodboard-media.entity.ts`
- `BE/apps/community-service/src/domain/entities/index.ts`
- `BE/apps/community-service/src/domain/dtos/community-media/index.ts`
- `BE/apps/community-service/src/domain/interfaces/community-media.repository.interface.ts`
- `BE/apps/community-service/src/domain/interfaces/moodboard-media.repository.interface.ts`
- `BE/apps/community-service/src/domain/interfaces/index.ts`
- `BE/apps/community-service/src/domain/services/community-media-storage.service.ts`
- `BE/apps/community-service/src/infrastructure/repositories/community-media.repository.ts`
- `BE/apps/community-service/src/infrastructure/repositories/moodboard-media.repository.ts`
- `BE/apps/community-service/src/infrastructure/repositories/index.ts`
- `BE/apps/community-service/src/application/commands/community-media/UploadCommunityMomentMedia.command.ts`
- `BE/apps/community-service/src/application/commands/community-media/UploadCommunityMoodboardMedia.command.ts`
- `BE/apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.ts`
- `BE/apps/community-service/src/application/commands/community-media/handlers/UploadCommunityMedia.command.handler.spec.ts`
- `BE/apps/community-service/src/application/commands/community-media/index.ts`
- `BE/apps/community-service/src/application/commands/index.ts`
- `BE/apps/community-service/src/presentation/microservice/community-media.microservice.controller.ts`
- `BE/apps/community-service/src/presentation/microservice/index.ts`
- `BE/apps/community-service/src/app.module.ts`

### Creation proof updates

- `BE/apps/api-gateway/src/presentation/http/controllers/community/moments.controller.ts`
- `BE/apps/api-gateway/src/presentation/http/controllers/community/moodboards.controller.ts`
- `BE/apps/community-service/src/domain/dtos/moments/create-moment.input.ts`
- `BE/apps/community-service/src/domain/dtos/moodboards/create-moodboard.input.ts`
- `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.ts`
- `BE/apps/community-service/src/application/commands/moments/handlers/CreateMoment.command.handler.spec.ts`
- `BE/apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.ts`
- `BE/apps/community-service/src/application/commands/moodboards/handlers/CreateMoodboard.command.handler.spec.ts`

### Frontend API and types

- `FE/artium-web/src/@shared/apis/profileMediaUploadApi.ts`
- `FE/artium-web/src/@shared/apis/profileApis.ts`
- `FE/artium-web/src/@domains/profile/types/index.ts`

## Important Implementation Constraints

- Public upload routes must be under `/community/uploads/...`, not `/artwork/uploads/...`.
- Storage paths must use `community/{userId}/moments` and `community/{userId}/moodboards`, not artwork ID paths.
- Backend accepts `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, and `video/webm`.
- Backend image max is 10MB; backend video max is 100MB.
- Moodboard upload batch max is 10 files.
- Upload response must include a backend-issued `mediaId`.
- Moment and moodboard create APIs must consume `mediaId` values and derive `userId` from auth.
- Do not trust client-provided external URLs as uploaded profile media proof.
- Frontend uploads must use `apiUpload`; do not manually set multipart `Content-Type`.
- Phase 33 must not build the moment or moodboard composer UI.

# Phase 30 Pattern Map

## Closest Existing Analogs

| New work | Closest analog | Pattern to reuse |
|----------|----------------|------------------|
| Gateway order invoice endpoint | `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts` | Use `JwtAuthGuard`, `@ApiBearerAuth()`, `sendRpc`, and private `getAuthorizedOrder`. |
| Payments microservice message | `BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts` | Add `@MessagePattern({ cmd: 'get_or_materialize_order_invoice' })` and delegate to `queryBus.execute(...)`. |
| Invoice query handler | `BE/apps/payments-service/src/application/queries/invoices/handlers/GetInvoiceByNumber.query.handler.ts` | Use `@QueryHandler`, inject repository interfaces, wrap errors through `RpcExceptionHelper`. |
| Invoice creation from items | `BE/apps/payments-service/src/application/commands/invoices/handlers/CreateInvoice.command.handler.ts` | Calculate subtotal/tax/discount/total and create invoice items through `IInvoiceItemRepository`. |
| Payment transaction lookup | `BE/apps/payments-service/src/infrastructure/repositories/payment-transaction.repository.ts` | Add no new repository pattern unless needed; use existing `findByOrderId` and `update`. |
| Order with items | `BE/apps/orders-service/src/application/queries/handlers/GetOrderById.query.handler.ts` | Existing `findWithItems` ensures gateway order authorization has item seller IDs. |

## Files Expected in Phase 30 Plans

### Payments-service contract and materialization

- `BE/libs/common/src/dtos/payments/invoices/order-invoice.dto.ts`
- `BE/libs/common/src/dtos/payments/invoices/index.ts`
- `BE/apps/payments-service/src/domain/interfaces/invoice.repository.interface.ts`
- `BE/apps/payments-service/src/infrastructure/repositories/invoice.repository.ts`
- `BE/apps/payments-service/src/application/queries/invoices/GetOrderInvoice.query.ts`
- `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.ts`
- `BE/apps/payments-service/src/application/queries/invoices/handlers/GetOrderInvoice.query.handler.spec.ts`
- `BE/apps/payments-service/src/application/queries/invoices/index.ts`
- `BE/apps/payments-service/src/application/index.ts`
- `BE/apps/payments-service/src/presentation/microservice/payments.microservice.controller.ts`
- `BE/apps/payments-service/src/app.module.ts`

### Gateway endpoint

- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.ts`
- `BE/apps/api-gateway/src/presentation/http/controllers/orders.controller.spec.ts`
- `BE/libs/common/src/dtos/orders/order.object.ts`
- `FE/artium-web/src/@shared/apis/orderApis.ts`

## Important Implementation Constraints

- Keep order access control in `OrdersController.getAuthorizedOrder`; do not add user authorization logic to payments-service that depends on trusting a body-supplied user ID.
- Do not create an orders-service invoice table.
- Do not make frontend derive invoice totals in Phase 30. Frontend type additions may expose the backend response shape only.
- Use `INV-${order.orderNumber}` for order-derived invoices.
- Rely on existing unique `invoice_number` for duplicate materialization protection; do not add new TypeORM schema changes in Phase 30.
- Treat `order.paymentStatus === 'paid'` as `InvoiceStatus.PAID`; otherwise use `InvoiceStatus.SENT`.
- Add exact query command string `get_or_materialize_order_invoice`.
- Add exact gateway route `@Get(':id/invoice')`.

FROM rabbitmq:3.13-management AS development

RUN apt-get update && apt-get install -y curl && \
    curl -L https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.13.0/rabbitmq_delayed_message_exchange-3.13.0.ez \
    -o /opt/rabbitmq/plugins/rabbitmq_delayed_message_exchange-3.13.0.ez

RUN echo '[rabbitmq_management, rabbitmq_delayed_message_exchange].' > /etc/rabbitmq/enabled_plugins

COPY rabbitmq.conf /etc/rabbitmq/

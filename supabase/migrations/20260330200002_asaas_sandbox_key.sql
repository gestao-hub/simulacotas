-- Configurar chave sandbox do Asaas para testes
UPDATE platform_settings
SET value = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjhmMzk2NGM4LThiYmQtNDE2ZS05NzcxLTVmMTQ0OGZkZGQyNzo6JGFhY2hfNjcyNzJlMzYtNjJlMy00ZTVmLWE5ZGUtYzI2NzgyMzkzNzM4',
    is_active = true
WHERE key = 'ASAAS_API_KEY';

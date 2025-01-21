-- Connect to the database and run this to generate new keys
SELECT encode(
  hmac(
    'anon',
    'super-secret-jwt-token-with-at-least-32-characters',
    'HS256'
  ),
  'base64'
) as anon_key;

SELECT encode(
  hmac(
    'service_role',
    'super-secret-jwt-token-with-at-least-32-characters',
    'HS256'
  ),
  'base64'
) as service_role_key; 
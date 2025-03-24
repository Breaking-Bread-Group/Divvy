mkdir certs
openssl req -x509 -nodes -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365

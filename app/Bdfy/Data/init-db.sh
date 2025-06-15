#!/bin/bash
set -e

# Instalar Python y pip
apt-get update
apt-get install -y python3 python3-pip

# Instalar psycopg2
pip3 install psycopg2-binary

# Ejecutar el script de creación de tablas
python3 /docker-entrypoint-initdb.d/create_tables.py

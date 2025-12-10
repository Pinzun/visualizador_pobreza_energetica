# Visualizador de pobreza energética

Plataforma que permite **visualizar datos sobre pobreza energética en Chile**, estos datos se extraen de fuentes públicas, análisis internos del 
Ministerio de Energía y de otros Ministerios e instituciones académicas que estudian la materia.

La arquitectura de la plataforma, que esta basada en contenedores Docker, es:
    -**Frontend**:React + Vite (JavaScript)
    -**Backend**:Falsk + SQLAlchemy
    -**Base de datos**: MySQL
    -**Orquestación local**: Docker Compose
    -**Desarollo**: Por definir, probablemente serverless AWS

## Prerequisitos:
    -Docker & Docker Compose
    -Git
    -Terminal Bash    

# Desarrollo local 

El proyecto contiene un wrapper start.sh que orquesta el depliegue de los entornos dispónibles (hasta el momento solo dev)
Para levantar un entorno de desarrollo se debe ejecutar:
```bash
./start.sh dev
```    

# Utilidades
Fichas descriptivas para el cálculo de indicadores:
https://minenergia-my.sharepoint.com/:w:/g/personal/ncavallo_minenergia_cl/EagSpJ0EcRpGv3LZCk81NesB45eBTiz4wmZIaHxhR9vNTA?CID=3b3e0d33-f509-b2d1-d630-e1a888f3ffcc&e=Tru4yy
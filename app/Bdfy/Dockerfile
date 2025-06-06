# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copiamos solo los archivos del backend
COPY app/Bdfy/*.csproj ./Bdfy/
WORKDIR /app/Bdfy
RUN dotnet restore

# Ahora copiamos el resto del código
COPY app/Bdfy/. ./
RUN dotnet publish -c Release -o /app/publish

# Etapa de runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Bdfy.dll"]

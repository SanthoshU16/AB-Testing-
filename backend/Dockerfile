# Build stage
FROM eclipse-temurin:25-jdk AS build
COPY --chown=1000:1000 . /home/gradle/src
WORKDIR /home/gradle/src
RUN ./gradlew build -x test --no-daemon

# Run stage
FROM eclipse-temurin:25-jre
EXPOSE 8080
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]

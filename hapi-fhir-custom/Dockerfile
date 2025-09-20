FROM hapiproject/hapi:latest

# Create the database drivers directory
RUN mkdir -p /app/database_drivers

# Use Docker's ADD instruction to download the Derby driver directly.
# This does not require a shell or wget, so it works on minimal images.
ADD https://repo1.maven.org/maven2/org/apache/derby/derby/10.14.2.0/derby-10.14.2.0.jar \
    /app/database_drivers/derby.jar

# Add the Derby JAR to the classpath by copying it to the lib directory
RUN cp /app/database_drivers/derby.jar /app/lib/derby.jar

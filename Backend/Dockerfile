# Use the official Golang image to create a build artifact.
FROM golang:1.18 as builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files along with the .env file
COPY go.mod go.sum .env ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the rest of the source code into the container
COPY . .

# Build the Go app with static link
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

# Start a new stage from scratch using Alpine
FROM alpine:latest

RUN apk add --no-cache ca-certificates

# Set working directory to /root/
WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/server .

# Copy the .env file from the builder stage
COPY --from=builder /app/.env .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./server"]

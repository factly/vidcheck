#FROM golang:alpine AS build
#RUN apk --no-cache add gcc g++ make git
#WORKDIR /go/src/app
#COPY . .
#RUN GOOS=linux go build -ldflags="-s -w" -o ./bin/factcheck ./main.go
#
#FROM alpine:3.9
#RUN apk --no-cache add ca-certificates
#WORKDIR /usr/bin
#COPY --from=build /go/src/app/bin /go/bin
#EXPOSE 8080
#RUN go get -u github.com/cosmtrek/air
#ENTRYPOINT air -d
#

FROM golang:1.15.0-alpine3.12
WORKDIR /usr/src/app
COPY .
RUN go mod download
RUN go get -u github.com/cosmtrek/air
COPY . .
ENTRYPOINT air -d
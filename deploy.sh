#!/bin/bash

# Configuration

# Arguments
CONFIG=$1

if [ "$CONFIG" == "production" ]; then
  BUILD_DIR="dist/tbmaps-angular/production/browser"
  TARGET_PATH="/home/telaorg/www/tbmaps"
  SERVER="telaorg@sycomore"
elif [ "$CONFIG" == "beta" ]; then
  BUILD_DIR="dist/tbmaps-angular/beta/browser"
  TARGET_PATH="/home/beta/www/tbmaps"
  SERVER="beta@aphyllanthe"
else
  echo "Invalid configuration. Use 'production' or 'beta'."
  exit 1
fi

# Build and deploy
echo "Building with configuration: $CONFIG..."
ng build --configuration $CONFIG --base-href=/tbmaps/

echo "Deploying to server: $SERVER, path: $TARGET_PATH..."
rsync -r $BUILD_DIR/* $SERVER:$TARGET_PATH

echo "Deployment completed."

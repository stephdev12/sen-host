#!/bin/bash
echo "Starting build at $(date)" > build.log
echo "User: $(whoami)" >> build.log
echo "PATH: $PATH" >> build.log
which npm >> build.log
npm run build >> build.log 2>&1
echo "Build finished at $(date) with exit code $?" >> build.log

#!/bin/bash

# Navigate to the root directory of your project

# Sequentially update git submodules
git submodule update --init --recursive ./

# Now, run mprocs with your configuration file
mprocs
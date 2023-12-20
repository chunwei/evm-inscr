#!/bin/bash

target=$1

# 检查参数是否为空，默认使用 testnet
if [ -z "$target" ]; then
  target="testnet"
fi
# 根据目标参数设置 Dockerfile 路径
dockerfile_path="docker/$target/Dockerfile"

echo "using $dockerfile_path"
# 检查 Dockerfile 是否存在
if [ ! -f "$dockerfile_path" ]; then
  echo "Dockerfile 不存在"
  exit 1
fi

# 读取 package.json 文件并提取 version 字段
npm_package_version=$(node -p "require('./package.json').version")

dest_filename="evm-inscr.$target.v$npm_package_version"
# 构建镜像并输出带有版本号的镜像名
docker buildx build --platform linux/amd64 -o "type=tar,dest=$dest_filename.tar" -t "ebo:amd-v$npm_package_version" -f "$dockerfile_path" .

gzip "$dest_filename.tar"

shasum "$dest_filename.tar.gz"
#####################################
#* Data Source
#####################################
data "aws_availability_zones" "available" {}

#####################################
#* Local Variables
#####################################
locals {
  az_count       = var.az_count
  vpc_cidr_block = "10.0.0.0/16"
}

#####################################
#* VPC
#####################################
resource "aws_vpc" "vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

#####################################
#* Internet Gateway
#####################################
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }

  depends_on = [aws_vpc.vpc]
}

#####################################
#* Public Subnets
#####################################
resource "aws_subnet" "public" {
  count                   = length(data.aws_availability_zones.available.names)
  cidr_block              = cidrsubnet(local.vpc_cidr_block, 8, local.az_count + count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.vpc.id
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-sbnt-public-${count.index}"
  }

  depends_on = [aws_internet_gateway.igw]
}

#####################################
#* Route Table
#####################################
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.project_name}-rtbl-public"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_main_route_table_association" "public_main" {
  vpc_id         = aws_vpc.vpc.id
  route_table_id = aws_route_table.public.id
}

#####################################
#* Private Subnets
#####################################
resource "aws_subnet" "private" {
  count             = length(data.aws_availability_zones.available.names)
  cidr_block        = cidrsubnet(local.vpc_cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-sbnt-private-${count.index}"
  }
}

data "aws_availability_zones" "available" {}
locals {
  az_count       = var.az_count
  vpc_cidr_block = "10.0.0.0/16"
}

# vpc
resource "aws_vpc" "vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.projectName}-vpc"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.projectName}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(data.aws_availability_zones.available.names)
  cidr_block              = cidrsubnet(local.vpc_cidr_block, 8, local.az_count + count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.vpc.id
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.projectName}-sbnt-public-${count.index}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.projectName}-rtbl-public"
  }
}

# Route tables
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_main_route_table_association" "public_main" {
  vpc_id         = aws_vpc.vpc.id
  route_table_id = aws_route_table.public.id
}

# Create one ip per az
resource "aws_eip" "nat_gateway" {
  count = length(aws_subnet.public)

  tags = {
    Name = "${var.projectName}-eip-${count.index}"
  }
}

# Create one nat gateway per az
resource "aws_nat_gateway" "nat_gateway" {
  count         = length(aws_subnet.public)
  subnet_id     = aws_subnet.public[count.index].id
  allocation_id = aws_eip.nat_gateway[count.index].id

  tags = {
    Name = "${var.projectName}-ng-${count.index}"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = length(data.aws_availability_zones.available.names)
  cidr_block        = cidrsubnet(local.vpc_cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.vpc.id

  tags = {
    Name = "${var.projectName}-sbnt-private-${count.index}"
  }
}

# Route to the internet
resource "aws_route_table" "private" {
  count  = length(data.aws_availability_zones.available.names)
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway[count.index].id
  }

  tags = {
    Name = "${var.projectName}-rtbl-private-${count.index}"
  }
}

# Associate Route Table with Private Subnets
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

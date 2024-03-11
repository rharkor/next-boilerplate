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

# Attach the Internet Gateway to the VPC
resource "aws_route_table" "routetable" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.projectName}-routetable"
  }
}

# Associate Route Table with Subnets
resource "aws_route_table_association" "a" {
  subnet_id      = var.subnet_a_id
  route_table_id = aws_route_table.routetable.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = var.subnet_b_id
  route_table_id = aws_route_table.routetable.id
}

resource "aws_route_table_association" "c" {
  subnet_id      = var.subnet_c_id
  route_table_id = aws_route_table.routetable.id
}

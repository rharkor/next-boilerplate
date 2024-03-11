output "subnet_a_id" {
  value = aws_subnet.subnet_a.id
}

output "subnet_b_id" {
  value = aws_subnet.subnet_b.id
}

output "subnet_c_id" {
  value = aws_subnet.subnet_c.id
}
output "ecs_sg_id" {
  value = aws_security_group.ecs_sg.id
}

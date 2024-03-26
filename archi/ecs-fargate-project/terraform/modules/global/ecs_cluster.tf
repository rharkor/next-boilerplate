#####################################
#* ECS Cluster (with EC2)
#####################################
resource "aws_ecs_cluster" "ecs_cluster" {
  name = "${var.project_name}-ecs-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    name = "${var.project_name}-ecs-cluster"
  }
}


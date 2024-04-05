#####################################
#* ECS Task Definition
#####################################
resource "aws_ecs_task_definition" "ecs_td" {
  family                   = "${var.identifier}-ecs-task"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_iam_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory



  container_definitions = jsonencode([
    {
      name      = "${var.identifier}-container"
      image     = "${aws_ecr_repository.ecr.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        },
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.log_group.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
      environment = [
        {
          name  = "PORT"
          value = "3000"
        },
      ]
    },
  ])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }
}

resource "aws_cloudwatch_log_group" "log_group" {
  name              = "/ecs/${var.identifier}-ecs-task"
  retention_in_days = 30
}


#####################################
#* Service IAM Role
#####################################
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = "${var.identifier}-ecs-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role_policy.json
}

data "aws_iam_policy_document" "task_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task_iam_role" {
  name               = "${var.identifier}-ecs-task-execution-role-policy"
  assume_role_policy = data.aws_iam_policy_document.task_assume_role_policy.json
}

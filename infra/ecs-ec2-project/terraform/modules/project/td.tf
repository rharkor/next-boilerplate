#####################################
#* ECS Task Definition
#####################################
resource "aws_ecs_task_definition" "ecs_td" {
  family             = "${var.identifier}-ecs-task"
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_task_iam_role.arn

  container_definitions = jsonencode([
    {
      name              = "${var.identifier}-container"
      image             = "${aws_ecr_repository.ecr.repository_url}:latest"
      cpu               = var.cpu
      memoryReservation = var.memory
      essential         = true
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
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
          value = "80"
        },
      ]
    },
  ])
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

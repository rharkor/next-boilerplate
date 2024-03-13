locals {
  identifier = "default"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${local.identifier}-ecs-task-execution-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${local.identifier}-ecs-task-execution-role"
  }
}

resource "aws_iam_policy" "ecs_logs_policy" {
  name        = "${local.identifier}-ecs-logs-policy"
  description = "Allows ECS tasks to interact with CloudWatch Logs"
  policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource : [
          "arn:aws:logs:${var.region}::log-group:/ecs/${local.identifier}*",
          "arn:aws:logs:${var.region}::log-group:/ecs/${local.identifier}*:*"
        ]
      }
    ]
  })

  tags = {
    Name = "${local.identifier}-ecs-logs-policy"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_logs_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_logs_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

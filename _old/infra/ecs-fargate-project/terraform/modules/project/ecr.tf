#####################################
#* ECR
#####################################
resource "aws_ecr_repository" "ecr" {
  name                 = "${var.identifier}-ecr"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  force_delete = true
}

#####################################
#* Auto remove images from ECR
# Max 30 images
#####################################
resource "aws_ecr_lifecycle_policy" "ecr_lifecycle_policy" {
  repository = aws_ecr_repository.ecr.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire images when image count exceeds 30"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

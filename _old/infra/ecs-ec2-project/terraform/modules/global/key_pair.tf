#####################################
#* Key Pair
#####################################
resource "aws_key_pair" "default" {
  key_name   = "${var.project_name}-key"
  public_key = var.public_ec2_key
}

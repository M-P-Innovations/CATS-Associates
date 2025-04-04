data "aws_caller_identity" "current" {}

data "terraform_remote_state" "logging_layer" {
  backend = "s3"
  config = {
    bucket = "ma-cats-terraform-state"
    region = var.region
    key    = "cats-logging-layer/terraform.tfstate"
  }
}

terraform {
  backend "s3" {
    bucket         = "ma-cats-terraform-state"
    key            = "cats-user-management-backend/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "ma-cats-terraform-state-lock"
  }
}
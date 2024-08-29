resource "aws_dynamodb_table" "users" {
  name         = "${var.app-component}-dynodb"
  billing_mode = "PAY_PER_REQUEST" # Default setting with on-demand pricing
  hash_key     = "username"        # Primary key

  attribute {
    name = "username"
    type = "S" # String type
  }

  tags = {
    Name        = "user-management"
    Environment = "production"
  }
}



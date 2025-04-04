resource "aws_dynamodb_table" "cases" {
  name         = "${var.app-component}-dynodb"
  billing_mode = "PAY_PER_REQUEST" # Default setting with on-demand pricing
  hash_key     = "caseId"          # Primary key

  attribute {
    name = "caseId"
    type = "S" # String type
  }

  tags = {
    Name        = "case-management"
    Environment = "production"
  }
}



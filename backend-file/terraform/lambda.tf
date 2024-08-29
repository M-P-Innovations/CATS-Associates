data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../src"
  output_path = "${path.module}/lambda_source.zip"
  excludes = [
    # "**/node_modules/**"
  ]
}

# Deploy the Lambda function
resource "aws_lambda_function" "cats-user-management-backend-lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.app-component}-lambda"
  role             = aws_iam_role.cats_user_management_backend_lambda_exec_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x" # Replace with your runtime
  description      = "User management lambda"
  timeout          = 30

  environment {
    variables = {
      "JWT_SECRET"    = "Mysecret"
      "REGION"        = var.region
      "DYNAMODB_NAME" = aws_dynamodb_table.users.id
    }
  }
}



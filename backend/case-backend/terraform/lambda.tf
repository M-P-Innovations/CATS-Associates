data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../src"
  output_path = "${path.module}/lambda_source.zip"
  excludes = [
    "**/.env/**",
    "**/otpStore.json/**",
    "**/logger/**"
    # "**/node_modules/**"
  ]
}

# Deploy the Lambda function
resource "aws_lambda_function" "cats-case-management-backend-lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.app-component}-lambda"
  role             = aws_iam_role.cats_case_management_backend_lambda_exec_role.arn
  handler          = "index.handler"
  layers           = [data.terraform_remote_state.logging_layer.outputs.lambda-layer]
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x" # Replace with your runtime
  description      = "Case management lambda"
  timeout          = 300

  environment {
    variables = {
      "JWT_SECRET"         = "Mysecret"
      "REGION"             = var.region
      "DYNAMODB_NAME"      = aws_dynamodb_table.cases.id
      "USER_DYNAMODB_NAME" = "cats-user-management-backend-dynodb"
      "DEPENDENCY_PATH"    = "/opt/"
      "LOGGING_TABLE"      = "cats-event-logging"
      "LOGGER_ENABLED"     = true
      "DOCS_BUCKET_NAME"   = "cats-cases-documents"
      "ZIP_PROCESSOR_LAMBDA" = "cats-zip-files"
    }
  }
}


data "archive_file" "zipping_lambda" {
  type        = "zip"
  output_path = "${path.module}/zipping_files_lambda_source.zip"
  source_dir  = "../src_zipping"
  excludes = [
    "**/.env/**",
    # "**/node_modules/**"
  ]
}

# Deploy the Lambda function
resource "aws_lambda_function" "zip_files_lambda" {
  filename         = data.archive_file.zipping_lambda.output_path
  function_name    = "cats-zip-files"
  role             = aws_iam_role.cats_case_management_backend_lambda_exec_role.arn
  handler          = "index.handler"
  layers           = [data.terraform_remote_state.logging_layer.outputs.lambda-layer]
  source_code_hash = data.archive_file.zipping_lambda.output_base64sha256
  runtime          = "nodejs20.x" # Replace with your runtime
  description      = "Zip Case files lambda"
  timeout          = 300

  environment {
    variables = {
      "JWT_SECRET"         = "Mysecret"
      "REGION"             = var.region
      "DYNAMODB_NAME"      = aws_dynamodb_table.cases.id
      "USER_DYNAMODB_NAME" = "cats-user-management-backend-dynodb"
      "DEPENDENCY_PATH"    = "/opt/"
      "LOGGING_TABLE"      = "cats-event-logging"
      "LOGGER_ENABLED"     = true
      "DOCS_BUCKET_NAME"   = "cats-cases-documents"
      "ZIP_PROCESSOR_LAMBDA" = "cats-zip-files"
    }
  }
}


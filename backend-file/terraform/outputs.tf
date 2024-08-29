# Output 

output "api-key" {
  value     = aws_api_gateway_api_key.api_key.value
  sensitive = true
}

output "api-url" {
  value = aws_api_gateway_stage.stage.invoke_url
}

output "deployment-id" {
  value = aws_api_gateway_deployment.deployment.id
}

output "lambda-invoke-url" {
  value = aws_lambda_function.cats-user-management-backend-lambda.invoke_arn
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.users.name
}

# Output 

output "api_key" {
  value     = aws_api_gateway_api_key.api_key.value
  sensitive = true
}

output "api_url" {
  value = aws_api_gateway_stage.stage.invoke_url
}

output "api_gateway" {
  value = aws_api_gateway_rest_api.api
}

output "deployment_id" {
  value = aws_api_gateway_deployment.deployment.id
}

output "lambda_invoke_url" {
  value = aws_lambda_function.cats-user-management-backend-lambda.invoke_arn
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.users.name
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

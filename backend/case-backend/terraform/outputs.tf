# Output 

# output "api_key" {
#   value     = aws_api_gateway_api_key.api_key.value
#   sensitive = true
# }

# output "api_url" {
#   value = aws_api_gateway_stage.stage.invoke_url
# }

output "deployment_id" {
  value = aws_api_gateway_deployment.deployment.id
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.cases.name
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
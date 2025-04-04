# Case Register resource 

resource "aws_api_gateway_resource" "case_register" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = data.terraform_remote_state.api_gateway.outputs.api_gateway.root_resource_id
  path_part   = "case-register"
}

resource "aws_api_gateway_method" "case_register_post" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.case_register.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "case_register_post_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.case_register.id
  http_method             = aws_api_gateway_method.case_register_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_case_register" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.case_register.id
}

# Dashboard  

resource "aws_api_gateway_resource" "dashboard" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = data.terraform_remote_state.api_gateway.outputs.api_gateway.root_resource_id
  path_part   = "dashboard"
}

resource "aws_api_gateway_method" "dashboard_get" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.dashboard.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "dashboard_get_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.dashboard.id
  http_method             = aws_api_gateway_method.dashboard_get.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_dashboard" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.dashboard.id
}


# Case resources

resource "aws_api_gateway_resource" "case" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = data.terraform_remote_state.api_gateway.outputs.api_gateway.root_resource_id
  path_part   = "case"
}

# GET method
resource "aws_api_gateway_method" "case_get" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.case.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "case_get_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.case.id
  http_method             = aws_api_gateway_method.case_get.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

# POST method
resource "aws_api_gateway_method" "case_post" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.case.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "case_post_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.case.id
  http_method             = aws_api_gateway_method.case_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

# PUT method
resource "aws_api_gateway_method" "case_put" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.case.id
  http_method      = "PUT"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "case_put_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.case.id
  http_method             = aws_api_gateway_method.case_put.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_case" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.case.id
}

# Form
resource "aws_api_gateway_resource" "form" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = aws_api_gateway_resource.case.id
  path_part   = "form"
}

resource "aws_api_gateway_method" "form_post" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.form.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "form_post_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.form.id
  http_method             = aws_api_gateway_method.form_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_form" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.form.id
}

# Uploads

resource "aws_api_gateway_resource" "upload" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = aws_api_gateway_resource.case.id
  path_part   = "upload"
}

resource "aws_api_gateway_method" "upload_get" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.upload.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "upload_get_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.upload.id
  http_method             = aws_api_gateway_method.upload_get.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

resource "aws_api_gateway_method" "upload_post" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.upload.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "upload_post_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.upload.id
  http_method             = aws_api_gateway_method.upload_post.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_upload" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.upload.id
}

# Downloads

resource "aws_api_gateway_resource" "download" {
  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  parent_id   = aws_api_gateway_resource.case.id
  path_part   = "download"
}

resource "aws_api_gateway_method" "download_get" {
  rest_api_id      = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id      = aws_api_gateway_resource.download.id
  http_method      = "GET"
  authorization    = "NONE"
  api_key_required = true
}

resource "aws_api_gateway_integration" "download_get_integration" {
  rest_api_id             = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  resource_id             = aws_api_gateway_resource.download.id
  http_method             = aws_api_gateway_method.download_get.http_method
  type                    = "AWS_PROXY"
  integration_http_method = "POST"
  uri                     = aws_lambda_function.cats-case-management-backend-lambda.invoke_arn
}

module "cors_download" {
  source  = "squidfunk/api-gateway-enable-cors/aws"
  version = "0.3.3"

  api_id          = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
  api_resource_id = aws_api_gateway_resource.download.id
}

# Permission for API to invoke lambda
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cats-case-management-backend-lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${data.aws_caller_identity.current.account_id}:${data.terraform_remote_state.api_gateway.outputs.api_gateway.id}/*"
}


# Deploy API
resource "aws_api_gateway_deployment" "deployment" {
  triggers = {
    redeploy = sha1(timestamp())
  }

  rest_api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id

  depends_on = [

    # aws_api_gateway_method.health_get,
    aws_api_gateway_method.case_register_post,
    aws_api_gateway_method.case_post,
    aws_api_gateway_method.case_get,
    aws_api_gateway_method.case_put,
    aws_api_gateway_method.form_post,
    aws_api_gateway_method.upload_get,
    aws_api_gateway_method.upload_post,
    aws_api_gateway_method.download_get,
    aws_api_gateway_method.dashboard_get,

    # aws_api_gateway_integration.health_get_integration,
    aws_api_gateway_integration.case_register_post_integration,
    aws_api_gateway_integration.case_post_integration,
    aws_api_gateway_integration.case_get_integration,
    aws_api_gateway_integration.case_put_integration,
    aws_api_gateway_integration.form_post_integration,
    aws_api_gateway_integration.upload_get_integration,
    aws_api_gateway_integration.upload_post_integration,
    aws_api_gateway_integration.download_get_integration,
    aws_api_gateway_integration.dashboard_get_integration,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# resource "aws_api_gateway_stage" "stage" {
#   deployment_id = aws_api_gateway_deployment.deployment.id
#   rest_api_id   = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
#   stage_name    = "dev"
# }


# # Usage Plan

# resource "aws_api_gateway_usage_plan" "usageplan" {
#   name = "${var.app-component}_usage_plan"

#   api_stages {
#     api_id = data.terraform_remote_state.api_gateway.outputs.api_gateway.id
#     stage  = aws_api_gateway_stage.stage.stage_name
#   }
# }

# resource "aws_api_gateway_api_key" "api_key" {
#   name = "${var.app-component}-api-key"
# }

# resource "aws_api_gateway_usage_plan_key" "main" {
#   key_id        = aws_api_gateway_api_key.api_key.id
#   key_type      = "API_KEY"
#   usage_plan_id = aws_api_gateway_usage_plan.usageplan.id
# }


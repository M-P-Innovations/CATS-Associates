data "aws_iam_policy_document" "cats_case_management_backend_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cats_case_management_backend_lambda_exec_role" {
  name               = "${var.app-component}_lambda_exec_role"
  assume_role_policy = data.aws_iam_policy_document.cats_case_management_backend_assume_role_policy.json
}

resource "aws_iam_policy" "cats_case_management_backend_lambda_exec_policy" {
  name = "${var.app-component}_lambda_exec_policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Action = [
          "lambda:InvokeFunction",
          "lambda:InvokeAsync"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:*"
        ]
        Effect = "Allow"
        Resource = [
          "${aws_s3_bucket.cats-cases-documents.arn}",
          "${aws_s3_bucket.cats-cases-documents.arn}/*"
        ] # Change this to your bucket
      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:BatchWriteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:DescribeTable"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ssm:GetParameter"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cats_case_management_backend_lambda_exec_policy_attachment" {
  role       = aws_iam_role.cats_case_management_backend_lambda_exec_role.name
  policy_arn = aws_iam_policy.cats_case_management_backend_lambda_exec_policy.arn
}

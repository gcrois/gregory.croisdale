terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "root_domain" {
  description = "The root domain (e.g. regory.dev)"
  type        = string
}

variable "subdomain" {
  description = "The subdomain prefix (e.g. cancan). Use '@' for root."
  type        = string
  default     = "cancan"
}

# Keep these existing variables
variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}
variable "account_id" { type = string }
variable "zone_id" { type = string }
variable "project_name" { type = string }

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_pages_project" "static_site" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = "main"
}

resource "cloudflare_pages_domain" "custom_domain" {
  account_id   = var.account_id
  project_name = cloudflare_pages_project.static_site.name
  domain       = var.subdomain == "@" ? var.root_domain : "${var.subdomain}.${var.root_domain}"
}

resource "cloudflare_record" "site_dns" {
  zone_id = var.zone_id
  name    = var.subdomain
  type    = "CNAME"
  content = cloudflare_pages_project.static_site.subdomain
  proxied = true
}

output "full_url" {
  value = "https://${cloudflare_pages_domain.custom_domain.domain}"
}

output "deployment_command" {
  value = "npx wrangler pages deploy . --project-name=${var.project_name}"
}
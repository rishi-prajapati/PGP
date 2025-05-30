variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  default     = "f0a7d9f7-c130-469e-a103-d2dbce3b978c"
}

variable "location" {
  default = "East US"
}

variable "resource_group_name" {
  default = "my-aks-rg"
}

variable "aks_cluster_name" {
  default = "my-aks-cluster"
}

variable "dns_prefix" {
  default = "myaksdns"
}

variable "node_count" {
  default = 2
}

variable "storage_account_name_prefix" {
  default     = "st"
}

variable "storage_container_name" {
  default     = "tfstate"
}

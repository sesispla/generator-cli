variable "APP" {
  type          = string
  description   = "(Required) Application name this cluster belongs to"
}
variable "CREATOR" {
    type = string
    description = "Creator of this deployment"
}
variable "LOCATION" {
    type = string
    description = "Azure region to perform the deployment"
}

variable "KUBERNETES_CLUSTER_NAME" {
    type = string
    description = "Name of Kubernetes cluster"
}                        
variable "ADMIN_USER" { 
    type = string
    description = "VM admin username"
}      
variable "SSH_KEY" {
    type = string
    description = "ssh-key"
}
variable "KUBERNETES_VERSION" {
    type = string
    description = "Kubernetes version to deploy"
}

variable "KUBERNETES_AGENT_COUNT" {
    type = string
    description = "Number of Kubernetes agents required"
}
variable "KUBERNETES_VM_SIZE" {
    type = string
    description = "VM size used for cluster"
}
variable "OS_DISK_SIZE_GB" {
    type = number
    description = "Disk size of VMs"
}
variable "KUBERNETES_CLIENT_ID" {
    type = string
    description = "Kubernetes client ID (from Azure AD Service Principal)"
}
variable "KUBERNETES_CLIENT_SECRET" {
    type = string
    description = "Kubernetes client secret (from Azure AD Service Principal)"
}

variable "ACR_ENABLED" {
    type = bool
    description = "Container Registry is enabled? true or false"
    default = true
}

variable "ACR_SKU" {
    type = string
    description = "Container Registry SKU: Basic, Standard, Premium"
    default = "Basic"
}

variable "RBAC_ENABLED" {
    type = bool
    description = "(Optional) Enable Kubernetes Role-Based Access Control. Defaults to true"
}


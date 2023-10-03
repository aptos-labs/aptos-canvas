# This is a docker bake file in HCL syntax.
# It provides a high-level mechanism to build multiple dockerfiles in one shot.
# Check https://crazymax.dev/docker-allhands2-buildx-bake and https://docs.docker.com/engine/reference/commandline/buildx_bake/#file-definition for an intro.


variable "TARGET_CACHE_ID" {}
variable "IMAGE_TAG_PREFIX" {
  default = ""
}
variable "GIT_SHA" {}
variable "GCP_DOCKER_ARTIFACT_REPO" {}

variable "normalized_target_cache_id" {
  default = regex_replace("${TARGET_CACHE_ID}", "[^a-zA-Z0-9]", "-")
}
variable "normalized_image_tag_prefix" {
  default = regex_replace("${IMAGE_TAG_PREFIX}", "[^a-zA-Z0-9]", "-")
}

group "default" {
  targets = [
    "graffio-backend",
  ]
}

target "graffio-backend" {
  dockerfile = "Dockerfile"
  context    = "."
  cache-from = [
    "type=registry,ref=${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:cache-main",
    "type=registry,ref=${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:cache-auto",
    "type=registry,ref=${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:cache-${normalized_target_cache_id}",
  ]
  cache-to = ["type=registry,ref=${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:cache-${normalized_target_cache_id},mode=max"]
  tags = IMAGE_TAG_PREFIX == "" ? [
    "${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:${GIT_SHA}",
    ] : [
    "${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:${GIT_SHA}",
    "${GCP_DOCKER_ARTIFACT_REPO}/graffio-backend:${normalized_image_tag_prefix}_${GIT_SHA}",
  ]
}

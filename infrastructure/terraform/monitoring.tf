resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"

  namespace        = kubernetes_namespace.monitoring.metadata[0].name
  create_namespace = false

  values = [
    <<EOF
grafana:
  adminPassword: admin
  service:
    type: NodePort

prometheus:
  prometheusSpec:
    retention: 2d
EOF
  ]
}

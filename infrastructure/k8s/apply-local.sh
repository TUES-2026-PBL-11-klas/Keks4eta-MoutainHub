set -e

echo "==> Applying manifests..."
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/secret.yaml 
kubectl apply -f infrastructure/k8s/backend/api-gateway-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/api-gateway-service/deployment.yaml
kubectl apply -f infrastructure/k8s/backend/auth-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/auth-service/deployment.yaml
kubectl apply -f infrastructure/k8s/backend/review-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/review-service/deployment.yaml
kubectl apply -f infrastructure/k8s/backend/trail-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/trail-service/deployment.yaml
kubectl apply -f infrastructure/k8s/frontend/service.yaml
kubectl apply -f infrastructure/k8s/frontend/deployment.yaml

echo ""
echo "    Frontend:    http://localhost:80"
echo "    API Gateway: http://localhost:8080"
echo ""
echo "==> Watch rollout status:"
echo "    kubectl rollout status deployment -n mountainhub"

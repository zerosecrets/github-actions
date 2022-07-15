# Zero GitHub action
Use this action when you need to fetch the secrets from Zero to apply in GitHub workflow environment.

## Usage example
```yaml
steps:
  - uses: zerosecrets/private-github-actions/token-to-secrets@main
    id: zero
    with:
      zero-token: ${{ secrets.ZERO_TOKEN }}
      apis: ["aws-production", "stripe-production"]
  - name: echo secrets
    run: |
      echo "${{ steps.zero.outputs.zero-secrets }}"
      env | grep ZERO_SECRET
```

using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using System.Text.Json;

namespace TravelPlanService.Infrastructure
{
    internal static class ReliableJsonCache
    {
        public static async Task<T?> TryGetAsync<T>(
            IReliableStateManager stateManager,
            IReliableDictionary<int, string> cache,
            int key)
        {
            using var tx = stateManager.CreateTransaction();
            var result = await cache.TryGetValueAsync(tx, key);
            if (!result.HasValue) return default;
            return JsonSerializer.Deserialize<T>(result.Value);
        }

        public static async Task SetAsync<T>(
            IReliableStateManager stateManager,
            IReliableDictionary<int, string> cache,
            int key,
            T value)
        {
            var json = JsonSerializer.Serialize(value);
            using var tx = stateManager.CreateTransaction();
            await cache.AddOrUpdateAsync(tx, key, json, (_, _) => json);
            await tx.CommitAsync();
        }

        public static async Task RemoveAsync(
            IReliableStateManager stateManager,
            IReliableDictionary<int, string> cache,
            int key)
        {
            using var tx = stateManager.CreateTransaction();
            await cache.TryRemoveAsync(tx, key);
            await tx.CommitAsync();
        }
    }
}

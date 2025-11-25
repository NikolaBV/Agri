using Agri.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Agri.Persistence;

public static class Seed
{
    public static async Task SeedData(DataContext context, UserManager<AppUser> userManager)
    {
        if (!await context.Database.CanConnectAsync())
        {
            return;
        }

        if (!await userManager.Users.AnyAsync())
        {
            var users = new List<AppUser>
            {
                new AppUser
                {
                    DisplayName = "Farmer Tom",
                    UserName = "farmer.tom",
                    Email = "farmer.tom@example.com",
                    Bio = "Organic farmer sharing tips from my greenhouse.",
                },
                new AppUser
                {
                    DisplayName = "Soil Scientist Ana",
                    UserName = "ana.soil",
                    Email = "ana.soil@example.com",
                    Bio = "Agronomist focused on regenerative soil care.",
                },
            };

            foreach (var user in users)
            {
                await userManager.CreateAsync(user, "ChangeMe123!");
            }
        }

        if (!await context.Tags.AnyAsync())
        {
            var tags = new List<Tag>
            {
                new Tag { Name = "Composting" },
                new Tag { Name = "Irrigation" },
                new Tag { Name = "SoilHealth" },
                new Tag { Name = "UrbanFarming" },
                new Tag { Name = "Hydroponics" },
            };

            context.Tags.AddRange(tags);
            await context.SaveChangesAsync();
        }

        if (!await context.Posts.AnyAsync())
        {
            var tom = await userManager.Users.FirstAsync(u => u.UserName == "farmer.tom");
            var ana = await userManager.Users.FirstAsync(u => u.UserName == "ana.soil");

            var posts = new List<(Post post, string[] tags)>
            {
                (
                    new Post
                    {
                        Title = "DIY Drip Irrigation from Recycled Bottles",
                        Summary = "Build a budget-friendly drip system that keeps soil moist for up to 48 hours.",
                        Content = "Step 1: Gather 2L bottles... Step 2: Punch two tiny holes...",
                        IsPublished = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-5),
                        UpdatedAt = DateTime.UtcNow.AddDays(-2),
                        AuthorId = tom.Id,
                    },
                    new[] { "Irrigation", "UrbanFarming" }
                ),
                (
                    new Post
                    {
                        Title = "Starter Guide to Living Compost",
                        Summary = "How to turn kitchen scraps into nutrient-rich compost without foul smells.",
                        Content = "Balanced greens and browns are the secret. Start with...",
                        IsPublished = true,
                        CreatedAt = DateTime.UtcNow.AddDays(-3),
                        UpdatedAt = DateTime.UtcNow.AddDays(-1),
                        AuthorId = ana.Id,
                    },
                    new[] { "Composting", "SoilHealth" }
                ),
            };

            foreach (var (post, tagNames) in posts)
            {
                var tags = await context.Tags.Where(t => tagNames.Contains(t.Name)).ToListAsync();
                foreach (var tag in tags)
                {
                    post.PostTags.Add(new PostTag { Tag = tag });
                }

                context.Posts.Add(post);
            }

            await context.SaveChangesAsync();
        }
    }
}


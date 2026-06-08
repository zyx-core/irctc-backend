using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class GeoJsonFeature
    {
        public GeoJsonProperty properties { get; set; }
    }

    public class GeoJsonProperty
    {
        public string state { get; set; }
        public string code { get; set; }
        public string name { get; set; }
    }

    public class GeoJsonCollection
    {
        public List<GeoJsonFeature> features { get; set; }
    }

    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            // Ensure Admin User Exists
            if (!context.Users.Any(u => u.Username == "admin"))
            {
                using var sha256 = System.Security.Cryptography.SHA256.Create();
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes("adminpassword"));
                var hash = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
                
                context.Users.Add(new User
                {
                    Username = "admin",
                    FullName = "Administrator",
                    Email = "admin@irctc.com",
                    PasswordHash = hash,
                    IsAdmin = true
                });
                context.SaveChanges();
            }

            if (context.Stations.Count() > 100 && context.Trains.Any(t => t.SourceStation.Code == "ERS"))
            {
                return;   // DB has already been seeded correctly with Kerala major stations
            }

            // Wipe the DB to ensure clean relations.
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "stations.json");
            if (!File.Exists(jsonPath))
            {
                Console.WriteLine($"Could not find stations.json at {jsonPath}");
                return;
            }

            var jsonString = File.ReadAllText(jsonPath);
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var geoJson = JsonSerializer.Deserialize<GeoJsonCollection>(jsonString, options);

            var validFeatures = geoJson.features
                .Where(f => f.properties != null && !string.IsNullOrWhiteSpace(f.properties.code) && !string.IsNullOrWhiteSpace(f.properties.name))
                .ToList();

            var stations = new List<Station>();
            foreach (var feature in validFeatures)
            {
                stations.Add(new Station { 
                    Code = feature.properties.code, 
                    Name = feature.properties.name 
                });
            }

            context.Stations.AddRange(stations);
            context.SaveChanges();

            // Refetch to get IDs for foreign keys
            stations = context.Stations.ToList();

            // Many major stations in the JSON have state: null, so we explicitly list top Kerala stations
            var keralaCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "TVC", "KCVL", "QLN", "KYJ", "MVLK", "CNGR", "TRVL", "CGY", "KTYM", 
                "ALLP", "SRTL", "ERS", "ERN", "AWY", "AFK", "CKI", "IJK", "PUK", "TCR", 
                "WKI", "SRR", "PGT", "KTU", "TIR", "CLT", "BDJ", "TLY", "CAN", "PAY", "KGQ"
            };

            var keralaStations = stations.Where(s => keralaCodes.Contains(s.Code)).ToList();

            var trains = new List<Train>();
            var random = new Random();

            // Generate fake trains between all pairs of Kerala stations
            foreach (var src in keralaStations)
            {
                foreach (var dest in keralaStations)
                {
                    if (src.Code == dest.Code) continue;

                    // Generate 1-2 trains per route
                    int numTrains = random.Next(1, 3);
                    for (int i = 0; i < numTrains; i++)
                    {
                        var depTime = new TimeSpan(random.Next(0, 24), random.Next(0, 60), 0);
                        var arrTime = depTime.Add(TimeSpan.FromHours(random.Next(1, 10)));
                        
                        trains.Add(new Train
                        {
                            Number = random.Next(11000, 29999).ToString(),
                            Name = $"{src.Name.Split(' ')[0]} {dest.Name.Split(' ')[0]} EXP",
                            SourceStationId = src.Id,
                            DestinationStationId = dest.Id,
                            DepartureTime = depTime.ToString(@"hh\:mm"),
                            ArrivalTime = arrTime.ToString(@"hh\:mm")
                        });
                    }
                }
            }

            // Chunk train insertion to avoid max parameter limits in EF Core / MySQL
            int batchSize = 2000;
            for(int i = 0; i < trains.Count; i += batchSize)
            {
                var batch = trains.Skip(i).Take(batchSize).ToList();
                context.Trains.AddRange(batch);
                context.SaveChanges();
            }

            var meals = new List<Meal>
            {
                new Meal { Name = "Veg Standard Thali", Description = "Rice, Dal, 2 Parathas, Mix Veg, Pickle", Price = 120, Type = "VEG" },
                new Meal { Name = "Non-Veg Standard Thali", Description = "Rice, Dal, 2 Parathas, Chicken Curry, Pickle", Price = 150, Type = "NON-VEG" },
                new Meal { Name = "Veg Biryani", Description = "Served with Raita", Price = 130, Type = "VEG" },
                new Meal { Name = "Chicken Biryani", Description = "Served with Raita", Price = 170, Type = "NON-VEG" },
                new Meal { Name = "Paneer Butter Masala Combo", Description = "Paneer Butter Masala with 3 Rotis", Price = 160, Type = "VEG" },
                new Meal { Name = "Egg Curry Combo", Description = "Egg Curry with Rice", Price = 110, Type = "NON-VEG" }
            };

            foreach (var m in meals)
            {
                context.Meals.Add(m);
            }
            context.SaveChanges();
        }
    }
}

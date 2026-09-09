namespace ptxSeguimiento.Infrastructure.Configurations
{
    public class JwtSettings
    {
        public const string SectionName = "Jwt";

        public string Key { get; set; } = null!;
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
        public int ExpireMinutes { get; set; } = 480;
    }
}

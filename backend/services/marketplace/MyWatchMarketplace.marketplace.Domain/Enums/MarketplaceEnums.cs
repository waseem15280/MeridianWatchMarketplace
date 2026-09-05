namespace MyWatchMarketplace.marketplace.Domain.Enums;

public enum UserRole
{
    Buyer = 1,
    Seller = 2,
    Collector = 3
}

public enum WatchCondition
{
    Unworn = 1,
    Mint = 2,
    VeryGood = 3,
    Good = 4,
    Fair = 5
}

public static class WatchConditionExtensions
{
    public const string Unworn = "Unworn";
    public const string Mint = "Mint";
    public const string VeryGood = "Very Good";
    public const string Good = "Good";
    public const string Fair = "Fair";

    public static string ToDisplayString(this WatchCondition condition) => condition switch
    {
        WatchCondition.Unworn => Unworn,
        WatchCondition.Mint => Mint,
        WatchCondition.VeryGood => VeryGood,
        WatchCondition.Good => Good,
        WatchCondition.Fair => Fair,
        _ => condition.ToString()
    };

    public static WatchCondition FromString(string value) => value?.Trim() switch
    {
        Unworn => WatchCondition.Unworn,
        Mint => WatchCondition.Mint,
        VeryGood => WatchCondition.VeryGood,
        Good => WatchCondition.Good,
        Fair => WatchCondition.Fair,
        _ => Enum.TryParse<WatchCondition>(value, true, out var parsed) ? parsed : WatchCondition.Good
    };
}

public static class WatchMovementConstants
{
    public const string Automatic = "Automatic";
    public const string ManualWinding = "Manual Winding";
    public const string Quartz = "Quartz";
    public const string Tourbillon = "Tourbillon";
    public const string SpringDrive = "Spring Drive";
    public const string CoAxialChronometer = "Co-Axial Chronometer";

    public static readonly string[] All =
    [
        Automatic,
        ManualWinding,
        Quartz,
        Tourbillon,
        SpringDrive,
        CoAxialChronometer
    ];
}

public static class WatchCaseMaterialConstants
{
    public const string StainlessSteel = "Stainless Steel";
    public const string Oystersteel = "Oystersteel";
    public const string YellowGold18k = "18k Yellow Gold";
    public const string RosePinkGold18k = "18k Rose/Pink Gold";
    public const string WhiteGold18k = "18k White Gold";
    public const string Platinum = "Platinum";
    public const string Titanium = "Titanium";
    public const string Ceramic = "Ceramic";
    public const string Bronze = "Bronze";
    public const string TwoToneSteelGold = "Two-Tone (Steel & Gold)";

    public static readonly string[] All =
    [
        StainlessSteel,
        Oystersteel,
        YellowGold18k,
        RosePinkGold18k,
        WhiteGold18k,
        Platinum,
        Titanium,
        Ceramic,
        Bronze,
        TwoToneSteelGold
    ];
}


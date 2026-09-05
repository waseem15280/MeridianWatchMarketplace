using MyWatchMarketplace.SharedKernel.Common;

namespace MyWatchMarketplace.SellerHub.Domain.Common;

public class ReviewSubRatings : ValueObject
{
    public int Accuracy { get; set; } = 5;

    public int Communication { get; set; } = 5;

    public int Shipping { get; set; } = 5;

    public int Authenticity { get; set; } = 5;

    public ReviewSubRatings() { }

    public ReviewSubRatings(int accuracy, int communication, int shipping, int authenticity)
    {
        Accuracy = accuracy;
        Communication = communication;
        Shipping = shipping;
        Authenticity = authenticity;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Accuracy;
        yield return Communication;
        yield return Shipping;
        yield return Authenticity;
    }
}


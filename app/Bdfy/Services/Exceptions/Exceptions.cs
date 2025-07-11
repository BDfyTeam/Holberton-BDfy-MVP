namespace BDfy.Services
{
    public class NotFoundException(string message) : Exception(message) { }
    public class BadRequestException(string message) : Exception(message) { }
    public class UnauthorizedException(string message) : Exception(message) { }
    public class ForBidException(string message) : Exception(message){}
}